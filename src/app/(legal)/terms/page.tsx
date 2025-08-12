
export default function TermsOfServicePage() {
  return (
    <div>
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      
      <h2>1. Agreement to Terms</h2>
      <p>By using our application, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the application.</p>

      <h2>2. Medical Disclaimer</h2>
      <p>HealthLink Hub is a platform that connects patients with healthcare providers. We do not provide medical advice, diagnosis, or treatment. The information and services provided through the application are not a substitute for professional medical advice. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>

      <h2>3. User Accounts</h2>
      <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.</p>

      <h2>4. Prohibited Uses</h2>
      <p>You may use the Application only for lawful purposes and in accordance with these Terms. You agree not to use the Application in any way that violates any applicable national or international law or regulation.</p>

      <h2>5. Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

      <h2>6. Changes to Terms</h2>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.</p>

      <h2>7. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us at: contact@healthlinkhub.com</p>
    </div>
  );
}
