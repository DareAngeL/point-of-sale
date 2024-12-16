import { AuthBypModules, AuthModal } from "../../../../common/modal/AuthModal";

interface LoginFragmentProps {
  onAuthorize: () => void;
}

export function AuthFragment(props: LoginFragmentProps) {
  const {onAuthorize} = props;

  return (
    <>
      <AuthModal useFor={AuthBypModules.UTILITIES} customFn={onAuthorize} />
    </>
  );
}
