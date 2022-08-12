import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GetSample from '@/assets/images/get-sample.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import DangerousRaw from '@/components/DangerousRaw';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import Tooltip from '@/components/Tooltip';
import Close from '@/icons/Close';
import { SupportedSdk } from '@/types/applications';

import * as styles from './index.module.scss';

type Props = {
  appName: string;
  selectedSdk: SupportedSdk;
  isCompact?: boolean;
  onClose: () => void;
};

const getSampleProjectUrl = (sdk: SupportedSdk) => {
  const githubUrlPrefix = 'https://github.com/logto-io';

  switch (sdk) {
    case SupportedSdk.iOS:
      return `${githubUrlPrefix}/swift/tree/master/Demos/SwiftUI%20Demo`;
    case SupportedSdk.Android:
      return `${githubUrlPrefix}/kotlin/tree/master/android-sample-kotlin`;
    case SupportedSdk.React:
      return `${githubUrlPrefix}/js/tree/master/packages/react-sample`;
    case SupportedSdk.Vue:
      return `${githubUrlPrefix}/js/tree/master/packages/vue-sample`;
    case SupportedSdk.Vanilla:
      return `${githubUrlPrefix}/js/tree/master/packages/browser-sample`;
    case SupportedSdk.Next:
      return `${githubUrlPrefix}/js/tree/master/packages/next-sample`;
    case SupportedSdk.Express:
      return `${githubUrlPrefix}/express-example`;
    default:
      return '';
  }
};

const GuideHeader = ({ appName, selectedSdk, isCompact = false, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tipRef = useRef<HTMLDivElement>(null);

  const onClickGetSample = () => {
    const sampleUrl = getSampleProjectUrl(selectedSdk);
    window.open(sampleUrl, '_blank');
  };

  return (
    <div className={styles.header}>
      {isCompact && (
        <>
          <CardTitle
            size="small"
            title={<DangerousRaw>{appName}</DangerousRaw>}
            subtitle="applications.guide.header_description"
          />
          <Spacer />
          <IconButton className={styles.githubIcon} size="large" onClick={onClickGetSample}>
            <div ref={tipRef}>
              <GetSample />
            </div>
            <Tooltip anchorRef={tipRef} content={t('applications.guide.get_sample_file')} />
          </IconButton>
          <IconButton size="large" onClick={onClose}>
            <Close className={styles.closeIcon} />
          </IconButton>
        </>
      )}
      {!isCompact && (
        <>
          <IconButton size="large" onClick={onClose}>
            <Close className={styles.closeIcon} />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle
            size="small"
            title={<DangerousRaw>{appName}</DangerousRaw>}
            subtitle="applications.guide.header_description"
          />
          <Spacer />
          <Button type="plain" size="small" title="general.skip" onClick={onClose} />
          <Button
            className={styles.getSampleButton}
            type="outline"
            title="applications.guide.get_sample_file"
            onClick={onClickGetSample}
          />
        </>
      )}
    </div>
  );
};

export default GuideHeader;
