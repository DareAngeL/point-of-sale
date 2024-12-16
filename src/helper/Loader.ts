import { LoaderFunction } from "react-router-dom";


export type LoaderData<TLoaderFn extends LoaderFunction> = Awaited<ReturnType<TLoaderFn>> extends Response | infer D ? D : never;

export const loader = (async () => {
    // if (FORBIDDEN) return redirect('/signin')
    return { ok: true };
}) satisfies LoaderFunction;