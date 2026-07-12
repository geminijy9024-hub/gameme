import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export async function impact(enabled: boolean): Promise<void> {
  if (!enabled || !Capacitor.isNativePlatform()) return;
  await Haptics.impact({ style: ImpactStyle.Light });
}
