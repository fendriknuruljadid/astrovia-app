export interface MetaMapping {
    title: string | null;
    description: string | null;
    url: string | null;
    siteName: string | null;
    imageUrl: string | null;
    icon: Array<{
      url: string;
      sizes: string;
      type: string;
    }> | null;
    shortcut: string | null;
    apple: Array<{
      url: string;
      sizes: string;
      type: string;
    }> | null;
    canonical: string | null;
  }
  