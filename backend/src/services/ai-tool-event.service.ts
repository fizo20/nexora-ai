export type ToolEvent = {
  type: "tool";

  name: string;

  status: "running" | "success" | "error";
};

export function emitToolEvent(
  callback: ((event: ToolEvent) => void) | undefined,

  name: string,

  status: "running" | "success" | "error",
) {
  callback?.({
    type: "tool",

    name,

    status,
  });
}
