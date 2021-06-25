import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-icon-selector',
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.scss'],
})
export class IconSelectorComponent implements OnInit {

  allIcons : string[] = ["battery-dead-outline","pulse-outline","expand","flag-outline","filter-circle-outline","bookmarks","car-sharp","chevron-back-circle","book","golf","open","logo-foursquare","calendar-sharp","contrast-sharp","arrow-forward-sharp","logo-deviantart","notifications-circle-outline","disc","bag-remove","repeat","cloud-done","git-branch","ribbon-outline","folder-sharp","car-outline","mail-unread","logo-yahoo","pizza-outline","return-up-back-outline","chevron-forward-sharp","logo-ionitron","calendar-clear","logo-tiktok","cafe-outline","people-circle","mic-off-outline","hammer-sharp","git-pull-request","ear-outline","phone-portrait-outline","snow-outline","server-outline","logo-github","thumbs-up","attach-sharp","glasses-outline","play-skip-back-circle","hand-left-outline","heart-dislike-sharp","watch","scan-sharp","timer-sharp","sync-circle","play-forward-circle-sharp","swap-horizontal-outline","eyedrop-sharp","shuffle","football-sharp","logo-amazon","reorder-two-outline","alert-outline","bluetooth-sharp","ellipsis-horizontal-outline","log-out-sharp","bag-handle-outline","cart-outline","volume-high","logo-euro","chatbubble-ellipses-sharp","logo-apple-appstore","thermometer-sharp","alert-circle-outline","log-out","apps-sharp","medical","battery-half-sharp","stopwatch","close-circle-sharp","easel-sharp","refresh-circle-outline","dice-sharp","logo-twitch","bicycle-outline","git-network","share-social-outline","bug-outline","link-sharp","heart-circle-outline","at-circle","locate","trash","play-skip-forward","laptop","chatbox-sharp","logo-google","eye-off-sharp","pause-outline","nuclear-sharp","sync","call-sharp","card","menu-outline","tablet-portrait-outline","logo-tux","sad-sharp","toggle-sharp","hand-right-sharp","water-sharp","print","mail-sharp","thumbs-down-outline","reload-circle-outline","school","toggle-outline","leaf-sharp","accessibility","scan-outline","square-outline","shirt","at","sync-circle-outline","arrow-back-circle","bandage-sharp","crop-outline","contrast","settings","medkit-outline","logo-medium","accessibility-sharp","walk","options","cloud-outline","logo-amplify","arrow-down-circle-sharp","logo-figma","expand-sharp","radio-outline","phone-portrait-sharp","logo-vercel","print-sharp","cloud-circle-outline","compass-sharp","document-text-outline","basketball","person","swap-horizontal","leaf","build-sharp","cut-outline","settings-outline","scale","barbell-outline","documents-outline","egg","flash-off-outline","rose-sharp","logo-google-playstore","share-social","eye-outline","add-circle-outline","create-outline","return-down-forward","file-tray-full","hardware-chip-sharp","business","construct-sharp","checkmark-done-sharp","bulb","reorder-three-outline","home","mic-off-sharp","document","log-in-outline","male","film-sharp","train-outline","logo-xbox","remove-outline","square-sharp","bowling-ball-sharp","stop-circle-outline","globe-outline","wallet-sharp","id-card-sharp","wifi","checkmark-done-circle-sharp","thermometer","bag-remove-sharp","bulb-outline","car-sport-sharp","flash-off-sharp","pint","add-circle","browsers","rose-outline","arrow-redo","walk-outline","ban-sharp","construct","nuclear","shuffle-outline","pin","stats-chart","cloud-upload","gift-sharp","library","barcode-outline","chevron-back","stop-circle","document-sharp","volume-mute","logo-discord","barcode","play-back-circle","language-outline","add-sharp","play-back","git-commit","pricetag-sharp","snow","logo-ionic","notifications-off-circle","checkmark-circle-sharp","toggle","invert-mode-sharp","american-football-outline","caret-down-circle","recording","caret-down-outline","aperture-outline","tennisball","pie-chart-outline","cut","card-sharp","bookmark","tablet-landscape-sharp","help-circle","logo-angular","flask-sharp","shield-outline","briefcase-sharp","logo-soundcloud","document-attach","sad","eye-off-outline","search-circle-sharp","unlink-outline","eye-sharp","calculator-outline","cafe","thumbs-down-sharp","heart-half-outline","partly-sunny-sharp","reorder-two","color-fill","archive","document-lock-outline","play-skip-forward-circle-outline","logo-buffer","search-sharp","git-merge","business-outline","funnel","megaphone-outline","mic-circle-outline","pint-sharp","logo-youtube","document-text-sharp","musical-notes-sharp","volume-medium-sharp","return-up-forward","alarm-outline","text","flag","library-sharp","male-female-sharp","grid","color-filter-outline","caret-back-circle","fitness-sharp","person-sharp","heart-dislike-outline","flashlight-sharp","caret-up-sharp","color-wand","contract-sharp","time-sharp","receipt","arrow-back-outline","finger-print","arrow-down-outline","enter","create","sparkles","browsers-outline","cloud","gift-outline","person-circle-sharp","save-outline","help-sharp","browsers-sharp","chatbubbles-outline","footsteps","business-sharp","keypad-sharp","heart-dislike-circle-sharp","battery-charging-outline","pint-outline","invert-mode","trophy-outline","play-sharp","phone-landscape","logo-xing","color-palette-outline","reload-circle","chevron-back-circle-outline","car-sport","cloudy-outline","map-outline","pause-circle-outline","push-sharp","wallet","tv","heart-half-sharp","ellipsis-horizontal-sharp","mic-outline","calendar-number","headset","ellipse-sharp","football-outline","mail-outline","recording-outline","arrow-back","information-circle","volume-high-sharp","battery-dead-sharp","wine-outline","logo-octocat","sad-outline","nutrition-sharp","ribbon-sharp","eyedrop-outline","alarm-sharp","cash","dice","flash-sharp","flash-outline","mic-circle","transgender","help-buoy-sharp","arrow-undo-circle","book-outline","invert-mode-outline","trash-bin-outline","eyedrop","logo-vimeo","code-download-outline","volume-low-sharp","bookmarks-outline","logo-python","chevron-down-sharp","trash-bin-sharp","chevron-down","settings-sharp","triangle-outline","play-back-circle-outline","return-up-forward-outline","basket-outline","tennisball-outline","cart","return-down-forward-outline","finger-print-sharp","ellipsis-vertical-circle-outline","leaf-outline","aperture-sharp","cog","layers-outline","desktop-sharp","egg-outline","moon-outline","logo-dribbble","moon","mail-unread-outline","code-outline","radio-button-off-outline","play-forward-circle-outline","folder","reorder-two-sharp","navigate-circle-outline","alert-circle","navigate-sharp","git-compare","wifi-sharp","copy","musical-note-sharp","build-outline","cloudy-night","balloon-outline","logo-apple-ar","paper-plane-sharp","checkmark-circle-outline","document-outline","clipboard","remove-sharp","volume-off-outline","star-half-outline","logo-vue","woman-sharp","stats-chart-sharp","logo-capacitor","musical-note-outline","timer-outline","skull-outline","dice-outline","planet","play-skip-back-outline","medal-outline","id-card-outline","close-outline","today-outline","file-tray-full-sharp","fish","school-sharp","caret-up-circle-sharp","image-outline","cellular-outline","caret-forward-sharp","chatbubbles","cube-sharp","caret-up-outline","shield-sharp","checkmark-circle","logo-no-smoking","magnet-outline","cloud-sharp","heart-sharp","return-down-back-sharp","nuclear-outline","camera-reverse-outline","mic","infinite-sharp","heart-circle","file-tray-stacked","chevron-forward-circle-sharp","checkbox-outline","search-circle-outline","shapes-outline","remove-circle","git-compare-sharp","ellipsis-horizontal-circle-sharp","archive-outline","person-circle","caret-forward-circle-sharp","document-attach-sharp","play-circle","qr-code","bookmarks-sharp","arrow-redo-circle","call-outline","navigate-circle-sharp","podium-outline","square","rainy-outline","play-back-sharp","globe","logo-nodejs","color-palette-sharp","baseball","ban","musical-notes-outline","git-merge-outline","chatbubbles-sharp","create-sharp","bag-remove-outline","ice-cream","caret-up-circle","color-filter","stats-chart-outline","bookmark-sharp","arrow-undo-circle-outline","flash-off","logo-usd","logo-twitter","shield","ellipse","play-back-circle-sharp","trending-down-sharp","barbell","happy","git-commit-outline","logo-sass","file-tray-outline","person-remove","camera","rose","arrow-up-circle","basketball-sharp","chevron-up","send-outline","camera-outline","partly-sunny","menu","camera-reverse-sharp","logo-tumblr","logo-dropbox","add-outline","analytics-outline","ice-cream-outline","transgender-sharp","ellipsis-vertical-circle","open-outline","backspace-sharp","water","bandage-outline","flashlight","paw","terminal-sharp","pencil-sharp","subway-outline","caret-down","play-skip-forward-outline","cloud-circle","prism-outline","home-outline","keypad-outline","star-half","code-working","file-tray-sharp","person-circle-outline","heart-dislike-circle","trophy","bicycle","american-football-sharp","git-pull-request-outline","play-circle-sharp","document-attach-outline","code-sharp","lock-closed","reorder-four-sharp","play-back-outline","arrow-undo","flower-sharp","bonfire-outline","reader-outline","flower","paper-plane","filter-sharp","scale-sharp","caret-up-circle-outline","medical-outline","pricetags-sharp","code","subway-sharp","duplicate-outline","glasses","power-sharp","lock-closed-outline","apps-outline","bed-outline","filter-circle","logo-alipay","folder-open","logo-react","radio-button-off","diamond-sharp","flame-outline","boat","partly-sunny-outline","download-outline","speedometer-sharp","tennisball-sharp","ticket-sharp","wine-sharp","golf-outline","cube-outline","shield-checkmark-sharp","chevron-up-outline","close","telescope-outline","fish-sharp","reorder-four-outline","headset-sharp","bandage","unlink-sharp","menu-sharp","send","tablet-landscape","umbrella","sunny","logo-pwa","hand-left-sharp","fast-food","tablet-landscape-outline","qr-code-outline","push-outline","prism","gift","ticket","volume-medium-outline","skull","people-outline","search-outline","logo-firefox","hammer","body-outline","albums-sharp","egg-sharp","calendar-outline","play-skip-forward-sharp","list-circle-sharp","mail","folder-open-outline","radio-button-off-sharp","body","diamond-outline","file-tray-stacked-outline","ear","sparkles-sharp","contrast-outline","hourglass","log-in-sharp","checkmark-sharp","log-in","exit","baseball-sharp","medkit-sharp","unlink","ban-outline","chatbubble-outline","swap-horizontal-sharp","pause-circle-sharp","navigate-circle","exit-sharp","at-circle-sharp","fast-food-sharp","arrow-redo-circle-sharp","arrow-undo-sharp","body-sharp","remove-circle-outline","bag-sharp","volume-low-outline","alarm","calculator","filter-circle-sharp","briefcase","magnet-sharp","home-sharp","information-circle-outline","shapes","list-sharp","umbrella-outline","calculator-sharp","warning-outline","receipt-outline","beaker","hand-left","phone-portrait","play-skip-back-circle-sharp","megaphone","options-sharp","glasses-sharp","sync-sharp","videocam-sharp","beer-sharp","bus","reorder-four","notifications","color-wand-sharp","share-social-sharp","book-sharp","refresh-outline","scan-circle-outline","time-outline","laptop-sharp","play-outline","ticket-outline","briefcase-outline","flashlight-outline","cloud-done-sharp","ellipsis-horizontal-circle-outline","logo-stackoverflow","color-fill-outline","thunderstorm-sharp","checkmark-done-circle-outline","cart-sharp","airplane-outline","shuffle-sharp","desktop","mail-open-outline","help-buoy","car","code-slash-outline","compass-outline","information","ellipsis-vertical-circle-sharp","american-football","analytics","happy-outline","checkmark-done","arrow-back-circle-sharp","bed-sharp","locate-outline","logo-tableau","telescope","sunny-sharp","moon-sharp","arrow-undo-outline","close-sharp","battery-charging-sharp","arrow-redo-outline","pulse-sharp","locate-sharp","extension-puzzle-sharp","camera-reverse","alert-sharp","logo-skype","fitness","arrow-back-sharp","phone-landscape-outline","cloud-upload-outline","journal","backspace","refresh-circle-sharp","storefront-sharp","diamond","save-sharp","videocam","star","map-sharp","checkmark-outline","checkbox","thumbs-up-outline","layers","shield-half-outline","phone-landscape-sharp","hand-right-outline","swap-vertical-outline","download-sharp","logo-css3","radio-sharp","git-branch-sharp","chevron-up-sharp","heart-half","scale-outline","man-sharp","apps","code-download","color-wand-outline","power","return-up-forward-sharp","caret-down-circle-sharp","pie-chart-sharp","chatbox-ellipses-outline","balloon","play-skip-back-sharp","location-outline","checkbox-sharp","chevron-forward-circle","caret-forward-circle-outline","musical-note","at-outline","reorder-three","logo-wechat","git-merge-sharp","git-branch-outline","arrow-redo-sharp","text-sharp","arrow-down-circle-outline","calendar-clear-sharp","crop","battery-full-outline","basket-sharp","paw-sharp","cog-outline","caret-up","brush-outline","people-circle-outline","magnet","cellular-sharp","logo-pinterest","musical-notes","navigate","save","beaker-outline","logo-electron","water-outline","trending-up","watch-outline","reorder-three-sharp","power-outline","triangle","golf-sharp","volume-medium","chevron-down-circle-sharp","bar-chart-outline","person-remove-outline","clipboard-outline","git-commit-sharp","git-pull-request-sharp","reader","scan-circle-sharp","nutrition","logo-bitbucket","image","chatbubble-sharp","boat-sharp","bag-handle","footsteps-sharp","resize-sharp","exit-outline","medical-sharp","play-forward-sharp","trash-outline","logo-behance","male-female-outline","alert","shirt-outline","train","chatbox-ellipses-sharp","chatbox","remove-circle-sharp","school-outline","reader-sharp","caret-forward-outline","refresh-circle","refresh","move-outline","eye","mic-sharp","today","easel-outline","bulb-sharp","caret-down-circle-outline","help-circle-outline","pin-sharp","funnel-sharp","cloudy-night-sharp","calendar-clear-outline","stop-circle-sharp","stopwatch-outline","flame-sharp","download","logo-venmo","return-down-back","radio-button-on-outline","logo-windows","brush","medal","logo-wordpress","logo-web-component","cloud-download-outline","chevron-forward-circle-outline","sync-circle-sharp","calendar-number-sharp","hammer-outline","at-circle-outline","filter","notifications-outline","logo-vk","female-sharp","newspaper-outline","woman","game-controller-outline","reload","lock-open","caret-down-sharp","arrow-redo-circle-outline","terminal","share","logo-html5","code-download-sharp","reload-circle-sharp","expand-outline","cloudy-sharp","caret-back-sharp","swap-vertical-sharp","star-outline","brush-sharp","headset-outline","repeat-outline","notifications-circle","archive-sharp","cloud-circle-sharp","file-tray-full-outline","videocam-outline","filter-outline","arrow-up","heart-outline","hardware-chip","caret-back-outline","arrow-down-circle","storefront-outline","wine","chevron-down-circle","disc-outline","fitness-outline","close-circle-outline","logo-markdown","code-working-outline","bag-check-sharp","mic-off-circle-outline","build","link","basket","caret-forward-circle","sparkles-outline","boat-outline","videocam-off-sharp","logo-docker","open-sharp","pencil","people","logo-steam","rainy","battery-full","arrow-undo-circle-sharp","color-fill-sharp","wifi-outline","help-circle-sharp","logo-instagram","arrow-up-sharp","volume-off","people-circle-sharp","battery-half-outline","checkmark-done-outline","restaurant-sharp","volume-low","basketball-outline","restaurant-outline","mail-open","pin-outline","folder-outline","rainy-sharp","help","logo-laravel","person-remove-sharp","videocam-off-outline","bag-add","newspaper-sharp","beer-outline","notifications-off","logo-paypal","move-sharp","mic-circle-sharp","bus-outline","train-sharp","notifications-off-outline","thunderstorm-outline","bluetooth","chatbubble","folder-open-sharp","move","resize-outline","beer","chevron-back-outline","code-working-sharp","terminal-outline","ellipsis-horizontal-circle","ribbon","repeat-sharp","bed","tablet-portrait-sharp","backspace-outline","ellipsis-vertical-sharp","mic-off","print-outline","bus-sharp","bag","female-outline","snow-sharp","pie-chart","logo-bitcoin","happy-sharp","copy-outline","play-forward-outline","list-circle","reload-sharp","pencil-outline","barbell-sharp","notifications-sharp","triangle-sharp","layers-sharp","umbrella-sharp","logo-designernews","walk-sharp","navigate-outline","play-skip-back-circle-outline","star-sharp","film","attach-outline","chevron-up-circle-sharp","mic-off-circle-sharp","caret-forward","chatbox-ellipses","bonfire","remove","infinite-outline","heart-circle-sharp","information-sharp","warning","pause","journal-sharp","bag-outline","logo-stencil","logo-closed-captioning","map","qr-code-sharp","arrow-forward-outline","pricetag-outline","cloud-offline-outline","logo-javascript","radio-button-on","woman-outline","library-outline","storefront","accessibility-outline","videocam-off","thunderstorm","notifications-circle-sharp","bluetooth-outline","bug-sharp","star-half-sharp","fast-food-outline","return-up-back","cafe-sharp","shield-checkmark-outline","timer","trophy-sharp","ellipsis-vertical","pause-circle","shield-half-sharp","laptop-outline","play-circle-outline","bag-add-sharp","logo-snapchat","battery-dead","flask","images","cloud-offline","cash-sharp","duplicate-sharp","crop-sharp","hand-right","tablet-portrait","hardware-chip-outline","arrow-forward-circle-sharp","enter-sharp","football","hourglass-outline","earth","volume-mute-sharp","cog-sharp","time","pizza","return-up-back-sharp","arrow-down-sharp","add-circle-sharp","chevron-forward","at-sharp","albums","swap-vertical","return-down-back-outline","cloud-offline-sharp","id-card","logo-npm","trash-bin","barcode-sharp","medkit","card-outline","male-sharp","footsteps-outline","logo-firebase","receipt-sharp","tv-sharp","game-controller","arrow-back-circle-outline","arrow-forward-circle","person-add-outline","calendar","stop-outline","location-sharp","arrow-forward-circle-outline","close-circle","radio-button-on-sharp","link-outline","fish-outline","document-lock-sharp","earth-sharp","telescope-sharp","pizza-sharp","bag-check-outline","shapes-sharp","flag-sharp","bar-chart-sharp","search-circle","trash-sharp","thumbs-down","chatbubble-ellipses","logo-hackernews","duplicate","prism-sharp","code-slash-sharp","bookmark-outline","logo-chrome","logo-mastodon","trail-sign-sharp","play-skip-back","bag-check","bag-add-outline","key-sharp","resize","color-palette","play-forward-circle","radio","nutrition-outline","image-sharp","skull-sharp","checkmark","pricetags-outline","airplane","trending-up-sharp","cube","arrow-up-outline","logo-yen","lock-open-sharp","chevron-back-sharp","caret-back-circle-sharp","finger-print-outline","heart-dislike-circle-outline","heart-dislike","trending-down","arrow-forward","trail-sign","restaurant","chevron-back-circle-sharp","bar-chart","bonfire-sharp","male-outline","podium","medal-sharp","play-skip-forward-circle","git-compare-outline","construct-outline","baseball-outline","thermometer-outline","git-network-outline","alert-circle-sharp","help-buoy-outline","logo-linkedin","call","cloudy","battery-half","ellipse-outline","help-outline","search","text-outline","airplane-sharp","logo-whatsapp","caret-back-circle-outline","people-sharp","code-slash","person-add-sharp","shield-checkmark","logo-edge","key-outline","location","heart","earth-outline","paper-plane-outline","list-outline","grid-outline","logo-flickr","rocket-sharp","language","mail-unread-sharp","planet-outline","bicycle-sharp","battery-charging","log-out-outline","speedometer-outline","color-filter-sharp","wallet-outline","play-skip-forward-circle-sharp","copy-sharp","shirt-sharp","trending-down-outline","mail-open-sharp","logo-apple","funnel-outline","volume-high-outline","mic-off-circle","information-circle-sharp","chevron-down-circle-outline","keypad","disc-sharp","flower-outline","logo-codepen","trending-up-outline","cellular","stopwatch-sharp","cloud-download-sharp","notifications-off-sharp","watch-sharp","arrow-down","paw-outline","bowling-ball","ellipsis-vertical-outline","document-text","aperture","refresh-sharp","scan-circle","trail-sign-outline","flask-outline","arrow-up-circle-sharp","attach","share-sharp","male-female","checkmark-done-circle","desktop-outline","cloud-upload-sharp","options-outline","stop","calendar-number-outline","git-network-sharp","logo-rss","female","send-sharp","push","tv-outline","logo-playstation","infinite","images-outline","grid-sharp","server-sharp","documents","chatbubble-ellipses-outline","list","film-outline","add","journal-outline","information-outline","arrow-up-circle-outline","extension-puzzle-outline","bag-handle-sharp","ellipsis-horizontal","cloud-download","bowling-ball-outline","person-outline","cloud-done-outline","flash","eye-off","recording-sharp","ice-cream-sharp","compass","ear-sharp","logo-microsoft","scan","rocket-outline","pulse","notifications-off-circle-outline","documents-sharp","today-sharp","easel","images-sharp","camera-sharp","logo-gitlab","pricetags","bug","person-add","contract","share-outline","speedometer","document-lock","hourglass-sharp","logo-android","clipboard-sharp","language-sharp","planet-sharp","key","chatbox-outline","car-sport-outline","albums-outline","stop-sharp","file-tray","podium-sharp","play-forward","lock-open-outline","logo-slack","volume-mute-outline","warning-sharp","balloon-sharp","battery-full-sharp","transgender-outline","rocket","play","cash-outline","thumbs-up-sharp","server","game-controller-sharp","volume-off-sharp","cut-sharp","sunny-outline","flame","contract-outline","reload-outline","list-circle-outline","file-tray-stacked-sharp","pricetag","notifications-off-circle-sharp","logo-facebook","logo-reddit","shield-half","newspaper","man-outline","extension-puzzle","subway","globe-sharp","chevron-up-circle-outline","megaphone-sharp","cloudy-night-outline","caret-back","return-down-forward-sharp","man","analytics-sharp","chevron-up-circle","sync-outline","enter-outline","pause-sharp","beaker-sharp","lock-closed-sharp","chevron-down-outline","chevron-forward-outline"];
  
  shownIcons : string[] = this.allIcons.slice(0,30);
  shownIconsFiltered : string[];
  searchText : string = ""


  constructor() { }

  ngOnInit() {
    this.refreshFiltered()
  }

  @Output('iconSelected')
  iconSelected :  EventEmitter<string> = new EventEmitter<string>();

  loadData(event){
    console.log("LOAD MORE DATA?")
    if(this.searchText == ""){
    if(this.shownIcons.length < this.allIcons.length){
      console.log("LOAD MORE DATA!")
      this.shownIcons = this.shownIcons.concat(this.allIcons.slice(this.shownIcons.length-1,this.shownIcons.length-1+10))
      this.shownIconsFiltered = this.shownIcons;
    }
  }
    event.target.complete();
  }

  async refreshFiltered(){
    if(this.searchText == ""){
      this.shownIconsFiltered = this.shownIcons;
    }else{
      setTimeout(() => {
        this.shownIconsFiltered = this.allIcons.filter((val) => val.indexOf(this.searchText) >= 0);
  
      },0)
    }
  }

  onIconSelected(icon: string){
    this.iconSelected.emit(icon);
  }

}
