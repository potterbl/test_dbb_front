import {makeAutoObservable} from "mobx";

class UserStore {
    user: any = null

    constructor() {
        makeAutoObservable(this)
    }

    setUser(newUser: any){
        this.user = newUser
    }
}

const userStore = new UserStore()
export default userStore
