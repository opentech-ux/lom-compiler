interface String {
   rooted(): string;

   unRooted(): string;
}

String.prototype.rooted = function () {
   return this.startsWith('/') ? (this as string) : `/${this}`;
};

String.prototype.unRooted = function () {
   return this.startsWith('/') ? this.substr(1) : (this as string);
};
