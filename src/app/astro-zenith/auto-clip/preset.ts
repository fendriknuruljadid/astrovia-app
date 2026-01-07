export type CaptionPreset = {
    name: string
    label: string
    previewVideo: string
    previewImage: string
    position: "top" | "center" | "bottom" | "none"
    type: "none" | "standard" | "custom"
    presetParent?: string
  }

export const CAPTION_PRESETS: CaptionPreset[] = [
    {
      name: "none",
      label: "No Subtitle",
      previewVideo: "",
      previewImage: "",
      position: "none",
      type: "none",
    },
    {
      name: "hormozi_style",
      label: "Hormozi Style",
      previewVideo: "https://media.astrovia.id/subtitle-preset/hormozi.mp4?v1",
      previewImage: "https://media.astrovia.id/subtitle-preset/hormozi.png",
      position: "bottom",
      type: "standard",
    },
    {
      name: "tiktok_yellow",
      label: "TikTok Yellow",
      previewVideo: "https://media.astrovia.id/subtitle-preset/tiktok_yellow.mp4",
      previewImage: "https://media.astrovia.id/subtitle-preset/tiktok_yellow.png",
      position: "center",
      type: "standard",
    },
    // {
    //   name: "custom",
    //   label: "Custom",
    //   previewVideo: "https://cdn.xxx/hormozi_2.mp4",
    //   previewImage: "https://cdn.xxx/hormozi_2.png",
    //   position: "center",
    //   type: "custom",
    //   presetParent: "hormozi",
    // },
  ]
  