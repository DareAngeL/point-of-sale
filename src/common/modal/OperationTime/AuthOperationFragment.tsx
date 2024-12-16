import { AuthBypModules } from "../AuthModal";
import { AuthModalOperation } from "../AuthModal2";


interface AuthOperationFragmentProps {
  onAuthorized: () => void;
}

export function AuthOperationFragment(props: AuthOperationFragmentProps) {

  const { onAuthorized } = props;

  const onAuth = () => {
    onAuthorized();
  }

  return (
    <>
      <AuthModalOperation
        customFn={onAuth}
        useFor={AuthBypModules.OPERATIONS} 
      />
    </>
  );
}
