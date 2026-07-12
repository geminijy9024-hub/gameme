import type { ReactNode } from "react";
export function ScreenHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) { return <header className="screen-header"><div><small>{eyebrow}</small><h1>{title}</h1></div>{action}</header>; }
