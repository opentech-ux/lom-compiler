// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface String {
   /**
    * @description Adds a leading slash to the string value if needed.
    *
    * @returns {string} The string value with a leading slash.
    */
   rooted(): string;
   /**
    * @description Removes the leading slash of the string value if needed.
    *
    * @returns {string} The string value without a leading slash.
    */
   unRooted(): string;
}

String.prototype.rooted = function root() {
   return this.startsWith('/') ? (this as string) : `/${this}`;
};

String.prototype.unRooted = function unRoot() {
   return this.startsWith('/') ? this.substr(1) : (this as string);
};
