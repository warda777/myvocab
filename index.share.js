import { AppRegistry, ScrollView, Text, View } from "react-native";

function Row({ label, value }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontWeight: "600" }}>{label}</Text>
      <Text selectable>{value ?? "—"}</Text>
    </View>
  );
}

function ShareRoot(props) {
  const {
    url,
    text,
    files,
    images,
    videos,
    preprocessingResults,
    initialViewWidth,
    initialViewHeight,
    pixelRatio,
    fontScale,
  } = props;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
        Share Extension läuft ☑️
      </Text>

      <Row label="URL" value={url} />
      <Row label="Text" value={text} />
      <Row
        label="Files"
        value={Array.isArray(files) ? files.join("\n") : null}
      />
      <Row
        label="Images"
        value={Array.isArray(images) ? images.join("\n") : null}
      />
      <Row
        label="Videos"
        value={Array.isArray(videos) ? videos.join("\n") : null}
      />
      <Row
        label="PreprocessingResults"
        value={
          preprocessingResults
            ? JSON.stringify(preprocessingResults, null, 2)
            : null
        }
      />

      <Text style={{ marginTop: 16, opacity: 0.6 }}>
        Debug: {initialViewWidth}×{initialViewHeight} @{pixelRatio}x, fontScale{" "}
        {fontScale}
      </Text>
    </ScrollView>
  );
}

AppRegistry.registerComponent("shareExtension", () => ShareRoot);
