import SignUpBanner from "../components/signupBannerSection";
import SignUpForm from "../components/signupForm";

export default function SignUpPage() {
    return <div className="flex">
        <SignUpForm/>
        <SignUpBanner/>
    </div>
}