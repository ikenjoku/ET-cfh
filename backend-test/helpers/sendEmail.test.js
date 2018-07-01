import { expect } from 'chai';
import sendInvitationEmail from '../../app/helpers/sendInvitationEmail';


describe('Send email invitation', () => {
  it('should return true if email goes through', () => {
    const user = {
      email: 'testemail@gmaill.com',
    };
    const link = 'http://localhost:4040/app';
    expect(sendInvitationEmail(user, link)).to.equal(true);
  });

  it('should return false if wrong email address is supplied', () => {
    const user = {
      email: 'wrongEmail.com',
    };
    const link = 'http://localhost:4040/app';
    expect(sendInvitationEmail(user, link)).to.equal(false);
  });

  it('should return false the link supplied is not a valid URL', () => {
    const user = {
      email: 'ben@gmail.com',
    };
    const link = 'htlocalhost:4040/app';
    expect(sendInvitationEmail(user, link)).to.equal(false);
  });
});
