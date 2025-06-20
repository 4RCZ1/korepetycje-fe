// TypeScript declaration for HTML input elements used in DateTimePicker
declare global {
  namespace JSX {
    interface IntrinsicElements {
      input: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >;
    }
  }
}

export {};
