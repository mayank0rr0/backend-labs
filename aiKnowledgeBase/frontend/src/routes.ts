import ChatPage from "./pages/chat"
import LoginPage from "./pages/login"
import SignUpPage from "./pages/signup"
import UserPage from "./pages/user"

export const routes = [
    {
        routeName: "Home",
        path: "/",
        component: ChatPage
    },
    {
        routeName: "Sign Up",
        path: "/signup",
        component: SignUpPage
    },
    {
        routeName: "Login",
        path: "/login",
        component: LoginPage
    },
    {
        routeName: "My Account",
        path: "/me",
        component: UserPage
    }
]