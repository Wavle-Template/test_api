import { User } from "@app/user/user.model";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { UserLoader } from "../user.loader";
import { UserSocialLink } from "./social.model";

@Resolver(of => User)
export class SocialResolver {
    constructor(
        public userLoader: UserLoader,
    ){

    }
    @ResolveField(returns => [UserSocialLink], { nullable: "items", description: "소셜 서비스 연결 리스트" })
    async socials(@Parent() user: User) {
        return await this.userLoader.getSocials(user.id);
    }
}