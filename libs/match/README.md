# 매칭 모듈

보편적인 기능만 가진 모듈이며 다른 모듈에 추가적으로 들어갈시 확장될 수 있습니다.
MatchModule은 매칭되는 Target은 유저로 되어있으며, 변경이나 확장은 코드로 수정해야합니다.

ex) BusinessChat에 추가된 MatchModule은 채팅형 매칭 프로세스

## 주의사항
매칭 프로세스에 필요한 Mutation/Query가 들어간 Resolver는 기본적으로 Module에 Import 되어있지않습니다.
MatchModule를 Import해서 사용하는 Module에서 직접 구현하거나 Match/Business에 포함된 Resolver를 직접 Import해야합니다.


## 작성된 Business
### one-sided-match.resolver
1개의 MatchPost에 관리자가 일방적으로 매칭을 걸어주는 매칭 프로세스일때 사용

### auto-match.resolver
자동적으로 매칭을 걸어주는 프로세스일때 사용
