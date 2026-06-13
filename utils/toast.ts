import { toast } from "sonner";

export async function runAction<T extends { error: unknown }>(
    action: () => Promise<T>,
    onSuccess: () => void,
    loading: string,
    success: string,
) {
    return toast.promise(
        action().then((res) => {
            if (res.error) throw res.error;
            onSuccess();
            return res;
        }),
        {
            loading,
            success,
            error: (err) =>
                err instanceof Error ? err.message : "Something went wrong",
        },
    );
}
