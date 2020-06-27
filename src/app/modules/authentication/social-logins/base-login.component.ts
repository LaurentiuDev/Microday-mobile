import { Input, Output, EventEmitter, Inject } from '@angular/core';
import { LoginResult } from 'src/app/models/login-result';
import { PwaHelper } from 'src/app/shared/helpers/pwa.helper';
import { environment } from 'src/environments/environment';

export class BaseLoginComponent {
  protected authWindow: Window;
  protected listener: any;
  public isOpen = false;

  @Input() public action: 'add' | 'connect';
  @Output() public LoginSuccessOrFailed: EventEmitter<LoginResult> = new EventEmitter();

  constructor(private platform: string, private pwaHelper: PwaHelper) {
    this.listener = this.handleMessage.bind(this);
    if (window !== undefined) {
      if (window.addEventListener) {
        window.addEventListener('message', this.listener, false);
      } else {
        (window as any).attachEvent('onmessage', this.listener);
      }
    }
  }

  protected dispose() {
    if (window !== undefined) {
      if (window.removeEventListener) {
        window.removeEventListener('message', this.listener, false);
      } else {
        (window as any).detachEvent('onmessage', this.listener);
      }
    }
  }

  showPopup() {
    if (window !== undefined) {
      const medium = this.pwaHelper.isPwa() ? 'pwa' : 'web';

      // When the pwa is installed, and the app is visited from a browser,
      // Chrome will open the PWA instead of the current medium
      this.authWindow = window.open(`${environment.url}api/auth/${this.action}/${medium}/${this.platform}`, '_system', 'width=600,height=400');

      // https://stackoverflow.com/questions/55452230/why-window-open-displays-a-blank-screen-in-a-desktop-pwa-looks-obfuscated

      this.isOpen = true;
      const timer = setInterval(() => {
        if (this.authWindow.closed) {
          this.isOpen = false;
          clearInterval(timer);
        }
      });
    }
  }

  handleMessage(event: Event) {
    const message = event as MessageEvent;
    // Only trust messages from the below origin.
    // if (!environment.urlFront.startsWith(message.origin)) return;

    // Filter out Augury
    if (message.data.messageSource != null)
      if (message.data.messageSource.indexOf('AUGURY_') > -1) return;
    // Filter out any other trash
    if (message.data === '' || message.data == null) return;

    const result = JSON.parse(message.data) as LoginResult;
    const medium = this.pwaHelper.isPwa() ? 'pwa' : 'web';
    if ((result.platform === this.platform) && (result.medium === medium)) {
      this.authWindow.close();
      this.LoginSuccessOrFailed.emit(result);
    }
  }
}
