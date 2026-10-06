export interface AppDownloadStoreInfo {
  rating: number
  downloads: string
  href: string
}

export const appDownloadInfo: {
  googlePlay: AppDownloadStoreInfo
  appStore: AppDownloadStoreInfo
} = {
  googlePlay: {
    rating: 4.6,
    downloads: '10 crore+ Downloads',
    href: 'https://play.google.com/store/apps/details?id=com.redbus',
  },
  appStore: {
    rating: 4.7,
    downloads: '1.5 crore+ Downloads',
    href: 'https://apps.apple.com/app/redbus/id456463380',
  },
}
