
export default function PrivacyPolicyPage() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to HealthLink Hub. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

      <h2>2. Information We Collect</h2>
      <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
      <ul>
        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Application.</li>
        <li><strong>Health Information:</strong> Information related to your health, such as symptoms, appointment history, and prescriptions, which is necessary to provide our services.</li>
      </ul>

      <h2>3. Use of Your Information</h2>
      <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
      <ul>
        <li>Create and manage your account.</li>
        <li>Facilitate virtual consultations between you and healthcare providers.</li>
        <li>Process transactions and send you related information, including confirmations and reminders.</li>
        <li>Manage medical records and prescription history.</li>
      </ul>

      <h2>4. Disclosure of Your Information</h2>
      <p>We do not share your personal information with third parties except as described in this Privacy Policy. We may share information we have collected about you in certain situations, such as with the doctor you book an appointment with.</p>

      <h2>5. Security of Your Information</h2>
      <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

      <h2>6. Contact Us</h2>
      <p>If you have questions or comments about this Privacy Policy, please contact us at: contact@healthlinkhub.com</p>
    </div>
  );
}
