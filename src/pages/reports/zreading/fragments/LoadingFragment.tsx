import { Spin } from "antd";

interface LoadingFragmentProps {
  title: string;
}

export function LoadingFragment(props: LoadingFragmentProps) {
  return (
    <>
      <div className="flex ">
        <Spin />
        <p className="mx-5">{props.title}</p>
      </div>
    </>
  );
}
