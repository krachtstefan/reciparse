import type { FC, ReactElement } from "react";

type ConditionalWrapperProps = {
  condition: boolean;
  wrapper: (children: ReactElement) => ReactElement;
  children: ReactElement;
};

export const ConditionalWrapper: FC<ConditionalWrapperProps> = ({
  condition,
  wrapper,
  children,
}) => (condition ? wrapper(children) : children);
