import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  email: string
  reset_url: string
}

export const PasswordResetEmail = ({
  email,
  reset_url,
}: PasswordResetEmailProps) => (
  <Html lang="ms">
    <Head />
    <Preview>
      Tetapkan semula kata laluan anda menggunakan pautan di bawah. Jika anda tidak memintanya, abaikan e-mel ini. / 
      Use the link below to reset your password. If you didn't request this, you can ignore this email.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={header}>Keselamatan Akaun / Account Security</Heading>
        
        <Section style={content}>
          {/* Malay Section */}
          <Heading style={title}>Tetapkan Semula Kata Laluan</Heading>
          <Text style={lead}>
            Tekan butang di bawah untuk menukar kata laluan anda. Demi keselamatan, pautan ini sah untuk
            tempoh terhad dan hanya boleh digunakan sekali.
          </Text>
          
          <Section style={buttonSection}>
            <Link href={reset_url} style={button}>
              Tetapkan Semula / Reset
            </Link>
          </Section>
          
          <Text style={linkText}>Atau salin & tampal pautan ini ke pelayar anda:</Text>
          <Text style={urlText}>
            <Link href={reset_url} style={urlLink}>
              {reset_url}
            </Link>
          </Text>
          
          <Text style={note}>
            Jika anda tidak meminta penetapan semula kata laluan, abaikan e-mel ini. Akaun anda kekal selamat.
          </Text>

          <Hr style={divider} />

          {/* English Section */}
          <Heading style={{...title, marginTop: '0'}}>Reset Your Password</Heading>
          <Text style={lead}>
            Click the button below to set a new password. For your security, this link is valid for a limited
            time and can be used only once.
          </Text>
          
          <Section style={buttonSection}>
            <Link href={reset_url} style={button}>
              Reset Password
            </Link>
          </Section>
          
          <Text style={linkText}>Or copy and paste this link into your browser:</Text>
          <Text style={urlText}>
            <Link href={reset_url} style={urlLink}>
              {reset_url}
            </Link>
          </Text>
          
          <Text style={note}>
            If you didn't request a password reset, you can safely ignore this message.
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={footer}>
          <Text style={footerText}>
            Perlu bantuan? Balas e-mel ini atau hubungi sokongan di{' '}
            <Link href="mailto:support@primapahang.com" style={footerLink}>
              support@primapahang.com
            </Link>
            .<br/>
            Need help? Reply to this email or contact support at{' '}
            <Link href="mailto:support@primapahang.com" style={footerLink}>
              support@primapahang.com
            </Link>
            .
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

// Styles
const main = {
  backgroundColor: '#f6f7fb',
  margin: '0',
  padding: '24px 0',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.06)',
}

const header = {
  padding: '24px 24px 0',
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '1.2',
  color: '#111827',
  margin: '0',
}

const content = {
  padding: '20px 24px 24px',
}

const title = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 8px',
  lineHeight: '1.2',
}

const lead = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 14px',
}

const buttonSection = {
  margin: '18px 0 16px',
  textAlign: 'center' as const,
}

const button = {
  display: 'inline-block',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 18px',
  borderRadius: '8px',
  fontWeight: '600',
  textDecoration: 'none',
  fontSize: '14px',
}

const linkText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#374151',
  margin: '0 0 6px',
}

const urlText = {
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 12px',
  wordBreak: 'break-all' as const,
}

const urlLink = {
  color: '#3b82f6',
  textDecoration: 'none',
}

const note = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '12px 0 0',
  lineHeight: '1.6',
}

const divider = {
  margin: '16px 0',
  borderColor: '#e5e7eb',
}

const footer = {
  padding: '12px 24px 24px',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#6b7280',
  margin: '0',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'none',
}