
# 테스트 백엔드 서버
<br />
<br />

## deploy 결과
``` bash
[Deploy-Setting] setting project description to package.json 
[Deploy-Setting] setting project name to package.json 
[Deploy-Setting] 진행할 셋팅이 없습니다. 
[Deploy-Setting] is add SocialModule ? :  false
[Deploy-Setting] add naver social module success 
[Deploy-Setting] is add SocialModule ? :  true
[Deploy-Setting] add kakao social module success 
[Deploy-Setting] is add CommunityModule ? :  false
[Deploy-Setting] add community module success 
[Deploy-Setting] is add ChatModule ? :  false
[Deploy-Setting] add chat module success 
[Deploy-Setting] request business chat type :  common
[Deploy-Setting] is add BusinessChatModule ? :  false
[Deploy-Setting] add business chat module success 
[Deploy-Setting] request find password type :  email
[Deploy-Setting] is add FindPasswordModule ? :  false
[Deploy-Setting] add FindPasswordModule success 
[Deploy-Setting] request match module type :  one-sided
[Deploy-Setting] is add MatchModule ? :  false
[Deploy-Setting] add MatchModule success 
[Deploy-Setting] is add PhoneAuthModule ? :  false
[Deploy-Setting] add PhoneAuthModule success 
[Deploy-Setting] is add ServiceManageModule ? :  false
[Deploy-Setting] add ServiceManageModule success 
```
## 추가적으로 수정 할 곳
- 회원탈퇴
apps/api/src/user/user.admin.resolver.ts#L93  
=> 탈퇴 가능여부 또는 탈퇴 후 처리
- 일라스틱 서치 셋팅 체크
- 소셜 키 셋팅 -> env파일
    - 애플
    - 카카오
    - 네이버
    - Toast
- 이메일
메일 전송이 필요할시      

- 자동 매칭 스케쥴러
libs/match/src/business/auto/auto-match.scheduler.ts#L30-L37
자동 매칭 조건
