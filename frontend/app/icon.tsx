import { ImageResponse } from "next/og";

// Dimensões do ícone gerado (32x32 px)
export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

/**
 * Ícone do app renderizado via ImageResponse.
 * A cor de fundo (#1E40AF) corresponde ao token --primary definido em globals.css.
 * CSS vars não são suportadas pelo canvas do ImageResponse, portanto o valor é hardcoded.
 */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1E40AF",
          borderRadius: "8px",
        }}
      >
        {/* Caminho SVG exato do ícone "Bot" do Lucide */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
    ),
    { ...size },
  );
}