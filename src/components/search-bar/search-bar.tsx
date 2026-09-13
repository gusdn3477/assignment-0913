"use client";

import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

export type SearchBarProps = InputProps & { type?: "search" };

export function SearchBar({
  left = <Search className="size-4" aria-hidden="true" />,
  ...props
}: SearchBarProps) {
  return <Input {...props} type="search" left={left} />;
}
