import UIKit
import AVFoundation
import UniformTypeIdentifiers
import MobileCoreServices
import os.log

final class ShareExtensionViewController: UIViewController {
  
  private let FN_URL = URL(string: "https://naplllscmpqexahxtbwg.supabase.co/functions/v1/add_to_vocab")!
  private let ANON   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcGxsbHNjbXBxZXhhaHh0YndnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTYxNDUsImV4cCI6MjA3MTc5MjE0NX0.LGWHQnsahkEyOxsIGVLZW7igzkhCjdwdoJsZseIe3fo"          // darf client-seitig sein
  // MARK: - Capture API
  private let captureURL = URL(string: "https://naplllscmpqexahxtbwg.supabase.co/functions/v1/add_to_vocab")!
  // 🔐 exakt den neuen INGEST_TOKEN hier einsetzen:
  private let CAPTURE_TOKEN = "090e40f9b046fa059ce1140f8708d226ce6019d5c9ae7f626a45c847681ab65c"  // aus Secrets


  private let log = Logger(subsystem: "com.warda777.myVoCabin.share", category: "ShareExt")

  private var didClose = false
  private var closeTimer: DispatchSourceTimer?

  private func postCapture(term: String, url: String?, lang: String = "en", done: @escaping () -> Void) {
  var req = URLRequest(url: captureURL)
  req.httpMethod = "POST"
  req.setValue("application/json", forHTTPHeaderField: "Content-Type")
  req.setValue(CAPTURE_TOKEN, forHTTPHeaderField: "x-capture-token")

  let body: [String: Any] = ["term": term, "lang": lang, "context": url ?? ""]
  req.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

  URLSession.shared.dataTask(with: req) { data, resp, err in
    let status = (resp as? HTTPURLResponse)?.statusCode ?? -1
    let text = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
    self.log.debug("POST status=\(status) body=\(text, privacy: .public)")
    done()
  }.resume()
}


  override func viewDidLoad() {
  super.viewDidLoad()
  print("ShareExt started  ✅ BUILD-MARK: V4")   // <- neue Markierung
  startCloseTimer()
  loadAndSend()
}

// MARK: - Deine ersetzte loadAndSend()
private func loadAndSend() {
  print("WILL POST…")
  getShareData { [weak self] shared in
    guard let self else { return }
    // Direkt posten (schlank, ohne App-Group-Datei)
    self.postToSupabase(shared ?? [:]) {
      self.closeOnce("posted")  // Schließen erst nach der Antwort
    }
  }
}

// POST an Supabase senden – Logging über os.Logger
private func postToSupabase(_ shared: [String: Any], done: @escaping () -> Void) {
  // 1) Daten aus getShareData
  let term = (shared["text"] as? String)?
    .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
  let pageURL = shared["url"] as? String

  guard !term.isEmpty else {
    log.debug("POST skip: no term")
    done()
    return
  }

  // 2) Request bauen
  var req = URLRequest(url: captureURL)
  req.httpMethod = "POST"
  req.setValue("application/json", forHTTPHeaderField: "Content-Type")
  req.setValue(ANON, forHTTPHeaderField: "apikey")
  req.setValue("Bearer \(ANON)", forHTTPHeaderField: "Authorization")
  req.setValue(CAPTURE_TOKEN, forHTTPHeaderField: "x-capture-token")  // WICHTIG

  let body: [String: Any] = [
    "term": term,
    "lang": "en",
    "context": pageURL ?? ""
  ]
  req.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])

  // 3) Debug-Ausgaben (über Logger, damit du sie sicher siehst)
  log.debug("POST → \(self.captureURL.absoluteString, privacy: .public)")
  log.debug("TOKEN head=\(String(self.CAPTURE_TOKEN.prefix(4)), privacy: .public) tail=\(String(self.CAPTURE_TOKEN.suffix(4)), privacy: .public)")
  if let d = req.httpBody, let s = String(data: d, encoding: .utf8) {
    log.debug("BODY \(s, privacy: .public)")
  }

  // 4) Request
  URLSession.shared.dataTask(with: req) { data, resp, err in
    if let err = err {
      self.log.debug("POST error \(err.localizedDescription, privacy: .public)")
    }
    let status = (resp as? HTTPURLResponse)?.statusCode ?? -1
    let text = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
    self.log.debug("POST status=\(status) body=\(text, privacy: .public)")
    done()
  }.resume()
}

  private func closeOnce(_ reason: String) {
    guard !didClose else { return }
    didClose = true
    closeTimer?.cancel(); closeTimer = nil
    log.debug("Closing extension (\(reason, privacy: .public))")
    DispatchQueue.main.async { [weak self] in
      self?.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
  }

  private func startCloseTimer() {
  let t = DispatchSource.makeTimerSource(queue: .main)
  t.schedule(deadline: .now() + 10.0) // 10s Fallback
  t.setEventHandler { [weak self] in self?.closeOnce("guard-timer") }
  t.resume()
  closeTimer = t
}

  /*override func viewDidAppear(_ animated: Bool) {
  super.viewDidAppear(animated)
  // falls irgendetwas blockiert, schließen wir trotzdem
  DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
    self?.closeOnce("didAppear-guard")
    }
  }*/

  // MARK: - App Group I/O

  private func appGroupURL() -> URL? {
    guard let groupId = Bundle.main.object(forInfoDictionaryKey: "AppGroup") as? String else { return nil }
    return FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: groupId)
  }

  private func enqueueInboxItem(_ item: [String: Any]) {
    log.debug("Writing to AppGroup JSONL…")
    guard let baseURL = appGroupURL() else { return }
    let inboxDir = baseURL.appendingPathComponent("sharedData", isDirectory: true)
    try? FileManager.default.createDirectory(at: inboxDir, withIntermediateDirectories: true)

    let fileURL = inboxDir.appendingPathComponent("inbox.jsonl")
    guard var data = try? JSONSerialization.data(withJSONObject: item, options: []) else { return }
    data.append("\n".data(using: .utf8)!)

    if FileManager.default.fileExists(atPath: fileURL.path) {
      if let handle = try? FileHandle(forWritingTo: fileURL) {
        defer { try? handle.close() }
        try? handle.seekToEnd()
        try? handle.write(contentsOf: data)
      }
    } else {
      try? data.write(to: fileURL)
    }
    log.debug("✓ Appended JSONL entry")
  }

  private func buildInboxPayload(from shared: [String: Any]?) -> [String: Any] {
    var payload: [String: Any] = [
      "createdAt": ISO8601DateFormatter().string(from: Date()),
      "source": "share-extension"
    ]
    if let s = shared {
      ["text","url","title","files","preprocessingResults"].forEach { k in
        if let v = s[k] { payload[k] = v }
      }
    }
    return payload
  }

  // MARK: - Daten sammeln (nur Text/URL)

  private func getShareData(completion: @escaping ([String: Any]?) -> Void) {
    guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil)
      return
    }

    var shared: [String: Any] = [:]
    let group = DispatchGroup()

    for item in items {
      for provider in item.attachments ?? [] {

        // Safari JS preprocessing (selection/url/title)
        if provider.hasItemConformingToTypeIdentifier(kUTTypePropertyList as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypePropertyList as String, options: nil) { [weak self] any, _ in
            if let dict = any as? NSDictionary,
               let res  = dict[NSExtensionJavaScriptPreprocessingResultsKey] as? NSDictionary {
              if let sel = res["selection"] as? String, !sel.isEmpty { shared["text"] = sel }
              if let url = res["url"] as? String, !url.isEmpty { shared["url"] = url }
              if let title = res["title"] as? String, !title.isEmpty { shared["title"] = title }
              shared["preprocessingResults"] = res
            }
            self?.log.debug("Got JS preprocessing: text=\((shared["text"] as? String) ?? "", privacy: .public), url=\((shared["url"] as? String) ?? "", privacy: .public)")
            group.leave()
          }
        }

        // Reiner Text
        else if provider.hasItemConformingToTypeIdentifier(kUTTypeText as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeText as String, options: nil) { [weak self] any, _ in
            if let s = any as? String, !s.isEmpty { shared["text"] = s }
            self?.log.debug("Got plain text")
            group.leave()
          }
        }

        // URL / Datei
        else if provider.hasItemConformingToTypeIdentifier(kUTTypeURL as String) {
          group.enter()
          provider.loadItem(forTypeIdentifier: kUTTypeURL as String, options: nil) { [weak self] any, _ in
            if let url = any as? URL {
              if url.isFileURL {
                var files = (shared["files"] as? [String]) ?? []
                files.append(url.absoluteString)
                shared["files"] = files
              } else {
                shared["url"] = url.absoluteString
                self?.log.debug("Got URL: \((shared["url"] as? String) ?? "", privacy: .public)")
              }
            }
            group.leave()
          }
        }
      }
    }

    // Abschluss + Fallback
    var finished = false
    func finish() {
      guard !finished else { return }
      finished = true
      DispatchQueue.main.async { completion(shared.isEmpty ? nil : shared) }
    }
    group.notify(queue: .main) { finish() }
    DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { finish() }
  }
}
