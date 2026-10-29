// whimsy core 팔레트: 사탕 같은 파스텔 + 진한 자두색 외곽선
export const colors = {
  stone: '#fdf3ec',
  stoneDot: '#f4dfe8',
  bowl: '#fffdfb',
  broth: '#f6e2a9',
  noodle: '#fbf0cf',
  mint: '#9fe0d8',
  mintSoft: '#d8f5f0',
  pink: '#ffb8cc',
  pinkSoft: '#ffe3ec',
  lilac: '#d6c4ff',
  lilacSoft: '#efe7ff',
  butter: '#ffe9a0',
  sky: '#bfe2ff',
  ink: '#6b4a5e',
  inkSoft: '#a98a9c',
  white: '#ffffff',
};

export const fonts = {
  display: 'CherryBombOne_400Regular',
  body: 'Jua_400Regular',
};

// 스티커 느낌: 외곽선 + 아래로 밀린 단색 그림자
export const sticker = {
  borderWidth: 2,
  borderColor: colors.ink,
  shadowColor: colors.ink,
  shadowOpacity: 1,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 4 },
  elevation: 0,
} as const;

// 캘린더/셀로그 태그 색: 나 = 민트, 상대 = 핑크, 함께 = 라일락
export const whoColor = { me: colors.mint, partner: colors.pink, both: colors.lilac };
