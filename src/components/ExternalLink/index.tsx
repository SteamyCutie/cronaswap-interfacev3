import React, { FC, HTMLProps, useCallback } from 'react'

import ReactGA from 'react-ga'
import { classNames } from '../../functions'

const COLOR = {
  default: 'text-gray-800 dark:text-white opacity-80 hover:opacity-100',
  blue: 'text-blue opacity-80 hover:opacity-100',
  'blue-special': 'text-blue-special opacity-80 hover:opacity-100',
}

interface ExternalLinkProps extends Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> {
  href: string
  startIcon?: JSX.Element
  endIcon?: JSX.Element
}

const ExternalLink: FC<ExternalLinkProps> = ({
  target = '_blank',
  href,
  children,
  rel = 'noopener noreferrer',
  className = '',
  color = 'default',
  startIcon = undefined,
  endIcon = undefined,
  ...rest
}) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === '_blank' || event.ctrlKey || event.metaKey) {
        ReactGA.outboundLink({ label: href }, () => {
          console.debug('Fired outbound link event', href)
        })
      } else {
        event.preventDefault()
        // send a ReactGA event and then trigger a location change
        ReactGA.outboundLink({ label: href }, () => {
          window.location.href = href
        })
      }
    },
    [href, target]
  )

  return (
    <a
      target={target}
      rel={rel}
      href={href}
      onClick={handleClick}
      className={classNames(
        'text-baseline whitespace-nowrap transition-all font-extrabold',
        COLOR[color],
        (startIcon || endIcon) && 'space-x-1 flex items-center justify-center',
        className
      )}
      {...rest}
    >
      {startIcon && startIcon}
      {children}
      {endIcon && endIcon}
    </a>
  )
}

export default ExternalLink
