import CenterBox from "./box";
import Button from "./button";
import FormBox from "./formBox";
import Input from "./input";
import SectionHead from "./sectionHead";

export default function SignUpForm() {
    
    return <CenterBox>
            {/* Form Heading */}
            <SectionHead title="Sign Up Form" subs="Already a user? Login Here"/>
            
            <FormBox>
                {/* Form Inputs */}
                    <Input title="Name" placeholder="Enter your name" />    
                    <Input title="Email" placeholder="Enter your email address" />                        
                    <Input title="Password" placeholder="Enter your password" variant="password"/>    

                {/* Form Submit */}
                    <Button onClick={() => {}}>
                        Submit
                    </Button>
            </FormBox>
    </CenterBox>       
}