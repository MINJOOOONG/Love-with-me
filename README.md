# 2uram

파스텔톤 커플 셀로그 앱 (Expo / React Native). 하나의 코드로 **웹(Vercel)** 과 **iOS·Android 앱**을 모두 만듭니다.

- **인트로**: 크리스탈 딤섬 누들수프 일러스트 + `2uram`
- **01 Selog**: 한 시간마다 최대 5초짜리 일상 영상을 남기는 24칸 타임라인. 나·상대를 따로 또는 겹쳐서 보기
- **02 Calendar**: 일정마다 나/상대 태그. 위쪽 태그를 둘 다 켜면 두 사람 스케줄이 겹쳐 보여요 (TimeTree 스타일). 태그 두 개 = 함께하는 일정
- 초대코드로 커플 연결, 매 정각 기록 알림(휴대폰 앱)

## 1. Supabase 준비 (무료)
1. https://supabase.com 에서 프로젝트 생성
2. SQL Editor 에 `supabase/schema.sql` 붙여넣고 실행
3. Authentication > Providers > Email 에서 **Confirm email 끄기** (둘이서만 쓸 때 편해요)
4. Project Settings > API 의 URL·anon key 를 `.env.example` 참고해서 `.env.local` 에 저장

## 2. 내 컴퓨터에서 실행
```
npm install
npx expo start          # 휴대폰에 Expo Go 앱 설치 후 QR 스캔
npx expo start --web    # 브라우저
```

## 3. Vercel 무료 배포 (웹)
1. https://vercel.com 에서 이 GitHub 레포 Import
2. Environment Variables 에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 추가
3. Deploy (빌드 설정은 `vercel.json` 에 있음)
4. 휴대폰 브라우저에서 열고 "홈 화면에 추가"

## 4. 앱스토어 출시 (나중에)
```
npx eas-cli@latest build --platform ios
npx eas-cli@latest submit --platform ios
```
Apple 개발자 계정(연 $99), Google Play 개발자 계정($25)이 필요해요.

## 폰트
현재 Fraunces Light(영문) + 고운바탕(한글). usemodify.com 폰트로 바꾸려면 `assets/fonts/` 에 파일을 넣고
`src/app/_layout.tsx` 의 `useFonts` 와 `src/lib/theme.ts` 의 `fonts` 를 바꾸면 돼요.
