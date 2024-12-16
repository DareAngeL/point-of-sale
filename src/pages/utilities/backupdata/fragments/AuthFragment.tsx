import { AuthBypModules, AuthModal } from "../../../../common/modal/AuthModal";

interface LoginFragmentProps {
  onAuth: () => void;
}

export function AuthFragment(props: LoginFragmentProps) {
  const {onAuth} = props;

  return (
    <>
      <AuthModal useFor={AuthBypModules.UTILITIES} customFn={onAuth} />
    </>
  );
}
