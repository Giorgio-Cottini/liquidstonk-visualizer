import { Stack, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import s from "./DropZone.module.css";

interface Props {
  onFile: (file: File) => void;
}

function JsonFileIcon() {
  return (
    <svg
      className={s.icon}
      width="46"
      height="46"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 2.75h6.2L18.25 8.8V19a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 19V5A2.25 2.25 0 0 1 6 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.75V8.5a1 1 0 0 0 1 1h5.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <text
        x="11"
        y="17.6"
        textAnchor="middle"
        fontSize="6.5"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="700"
        fill="currentColor"
      >
        {"{ }"}
      </text>
    </svg>
  );
}

export default function DropZone({ onFile }: Props) {
  return (
    <div className={s.dropWrap}>
      <Dropzone
        onDrop={(files) => files[0] && onFile(files[0])}
        accept={{ "application/json": [".json"] }}
        maxFiles={1}
        styles={{ root: { background: "transparent", border: "none" } }}
      >
        <Stack align="center" gap="sm" py="xl" style={{ pointerEvents: "none" }}>
          <Text size="xl" style={{ color: "var(--text-primary)" }}>
            Drop backtest JSON here
          </Text>
          <Text size="sm" style={{ color: "var(--text-secondary)" }}>
            or click to select file
          </Text>
          <JsonFileIcon />
        </Stack>
      </Dropzone>
    </div>
  );
}
