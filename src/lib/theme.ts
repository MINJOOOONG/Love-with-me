// 2uram 팔레트: 돌 질감 위의 크리스탈 딤섬, 90년대 인쇄물, 완두콩 꽃
export const colors = {
  stone: '#cdc6bd', // 인트로 배경 (회베이지 돌)
  paper: '#f4f1ec', // 앱 배경 (종이)
  line: '#ddd6cc', // 가는 선
  ink: '#3d3935', // 인쇄 글씨
  inkSoft: '#8b847b',
  white: '#ffffff',
  aqua: '#8fd3cd', // 크리스탈 딤섬 피
  aquaSoft: '#d4efe9',
  petal: '#f2b6c6', // 꽃잎 핑크
  petalSoft: '#fbe3ea',
  pea: '#b9d39f', // 완두콩 초록
  peaSoft: '#e5efd9',
};

export const fonts = {
  display: 'Fraunces_300Light', // 영문 로고·제목
  displayItalic: 'Fraunces_300Light_Italic',
  body: 'GowunBatang_400Regular', // 한글 본문 (레트로 명조)
  bodyBold: 'GowunBatang_700Bold',
};

// 캘린더·셀로그 태그 색: 나 = 아쿠아, 상대 = 꽃잎 핑크, 함께 = 완두콩 초록
export const whoColor = { me: colors.aqua, partner: colors.petal, both: colors.pea };

export const hairline = { borderWidth: 1, borderColor: colors.line } as const;
