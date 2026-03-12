import CenterBox from "./box";
import Button from "./button";
import FormBox from "./formBox";
import Input from "./input";
import SectionHead from "./sectionHead";

export default function LoginForm() {
    return <CenterBox wide={false} big={false}>
        <SectionHead title="Login" subs="New User? Signin" />
        <FormBox>
            <Input title="Email" placeholder="Enter your email adress"/>
            <Input title="Password" placeholder="Enter your password" variant="password"/>
            <Button onClick={() => {}}>
                Sign in
            </Button>
        </FormBox>
    </CenterBox>
}