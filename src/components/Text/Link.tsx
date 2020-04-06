import React from "react"
import classname from "../../utils/classname"
import { StyleNamespace } from "../../variables"

import "./Link.css"

export type LinkProps = React.Props<HTMLAnchorElement> &
  React.HTMLProps<HTMLAnchorElement> & {
    secondary?: boolean
  }

export default function Link({ secondary, ...props }: LinkProps) {
  return (
    <a
      {...props}
      className={classname([StyleNamespace, "Link", (props.onClick || props.href) && 'Link--actionable', props.className])}
    />
  )
}