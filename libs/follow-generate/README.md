# 팔로우 유저로 필터링되는 쿼리 생성

### 사용법

```typescript

@Module({
  imports: [
        ...,
        FollowFacadeModule.register<CommunityPost, CommunityPostEntity, CommunityPostListArgs>({
            listModel: CommunityPostList,
            argsModel: CommunityPostListArgs,
            crudService: CommunityPostService,
            entity: CommunityPostEntity,
            queryName: "communityPostsWithFollow"
            }, { userColumn: "authorId", description: "테스트!!!" })
        ...
  ],
  providers: [
    ...
  ]
})
class SomeModule {}

```