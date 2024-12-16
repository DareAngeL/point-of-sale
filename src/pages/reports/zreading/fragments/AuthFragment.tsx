import { AuthBypModules, AuthModal } from "../../../../common/modal/AuthModal";

interface LoginFragmentProps {
  onAuthorized: () => void;
}

export function AuthFragment(props: LoginFragmentProps) {

  const { onAuthorized } = props;

  const onAuth = () => {
    onAuthorized();
  }

  return (
    <>
      <AuthModal
        customFn={onAuth}
        useFor={AuthBypModules.ORDERING} 
      />
    </>
  );
}
