export interface INaverMe {
    resultcode: string; //호출 결과
    message: string;
    response: {
        id: string,
        nickname: string,
        name: string,
        email: string,
        gender: "F" | "M" | "U",
        age: string,
        birthday: string, //MM-DD형식,
        profile_image: string,
        birthyear: string,
        mobild: string
    }
}