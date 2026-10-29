import { Image, type ImageStyle } from 'react-native';

const sources = { mint: require('@/assets/images/glow-mint.png'), pink: require('@/assets/images/glow-pink.png') };

// 90년대 인쇄물의 에어브러시 번짐. 배경 장식용.
export function Glow({ color = 'mint', style }: { color?: keyof typeof sources; style?: ImageStyle }) {
  return <Image source={sources[color]} pointerEvents="none" resizeMode="stretch" style={[{ position: 'absolute', width: 300, height: 450 }, style]} />;
}
