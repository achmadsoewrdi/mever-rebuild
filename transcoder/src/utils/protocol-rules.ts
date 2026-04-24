export type ProtocolType = "hls" | "dash" | "plain";

class ProtocolManager {
  public getProtocol(codec: string, packager?: string): ProtocolType {
    if (packager) {
      const p = packager.toLocaleLowerCase();
      if (p === "hls") return "hls";
      if (p === "dash") return "dash";
      if (p === "plain") return "plain";
    }

    const c = codec.toLocaleLowerCase();
    if (c === "h264" || c === "h265" || c === "hevc") {
      return "hls";
    }

    if (c === "vp9" || c === "av1" || c === "vp8") {
      return "dash";
    }

    return "plain";
  }
}

export const protocolManager = new ProtocolManager();
