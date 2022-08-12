import classNames from 'classnames';
import { MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';

import Copy from '@/icons/Copy';
import Eye from '@/icons/Eye';
import EyeClosed from '@/icons/EyeClosed';

import IconButton from '../IconButton';
import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

type Props = {
  value: string;
  className?: string;
  variant?: 'text' | 'contained' | 'border' | 'icon';
  hasVisibilityToggle?: boolean;
};

type CopyState = TFuncKey<'translation', 'admin_console.general'>;

const CopyToClipboard = ({
  value,
  className,
  hasVisibilityToggle,
  variant = 'contained',
}: Props) => {
  const copyIconReference = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<CopyState>('copy');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.general' });
  const [showHiddenContent, setShowHiddenContent] = useState(false);

  const displayValue = useMemo(() => {
    if (!hasVisibilityToggle || showHiddenContent) {
      return value;
    }

    return '*'.repeat(value.length);
  }, [hasVisibilityToggle, showHiddenContent, value]);

  useEffect(() => {
    copyIconReference.current?.addEventListener('mouseleave', () => {
      setCopyState('copy');
    });
  }, []);

  const copy: MouseEventHandler<HTMLButtonElement> = async () => {
    setCopyState('copying');
    await navigator.clipboard.writeText(value);
    setCopyState('copied');
  };

  const toggleHiddenContent = () => {
    setShowHiddenContent((previous) => !previous);
  };

  return (
    <div
      className={classNames(styles.container, styles[variant], className)}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div className={styles.row}>
        {variant !== 'icon' && <div className={styles.content}>{displayValue}</div>}
        {hasVisibilityToggle && (
          <div className={styles.eye}>
            <IconButton onClick={toggleHiddenContent}>
              {showHiddenContent ? <EyeClosed /> : <Eye />}
            </IconButton>
          </div>
        )}
        <div ref={copyIconReference} className={styles.copyIcon}>
          <IconButton onClick={copy}>
            <Copy />
          </IconButton>
        </div>
        <Tooltip
          anchorRef={copyIconReference}
          content={t(copyState)}
          horizontalAlign="center"
          className={classNames(copyState === 'copied' && styles.successfulTooltip)}
        />
      </div>
    </div>
  );
};

export default CopyToClipboard;
