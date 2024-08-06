import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { Pressable } from "react-native";

type ButtonProps = {
	className?: string;
} & ComponentPropsWithoutRef<"button">;

export function Button({ className, ...props }: ButtonProps) {
	return <Pressable className={clsx(className)}>{props.children}</Pressable>;
}
