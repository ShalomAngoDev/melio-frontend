import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
  className?: string;
}

export interface ReCaptchaRef {
  reset: () => void;
  execute: () => void;
}

const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>(
  ({ onVerify, onExpire, onError, theme = 'light', size = 'normal', className = '' }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      },
    }));

    const handleVerify = (token: string | null) => {
      onVerify(token);
    };

    const handleExpire = () => {
      onExpire?.();
    };

    const handleError = () => {
      onError?.();
    };

    return (
      <div className={`flex justify-center ${className}`}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} // Clé de test par défaut
          onChange={handleVerify}
          onExpired={handleExpire}
          onErrored={handleError}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
