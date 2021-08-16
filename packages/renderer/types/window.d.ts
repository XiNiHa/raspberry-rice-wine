import type { BridgeApi } from '@/../../preload/src'

declare global {
  interface Window {
    bridgeApi: BridgeApi;
  }
}
