import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import Tokenizer from '../../app/helpers/tokenizer';

describe('Payload to token converter', () => {
  describe('Success cases', () => {
    before(async () => {
      const payload = { name: 'A test username', id: '123456ad', avatar: '' };
      const token = await Tokenizer(payload);
    });

    it(' Should return a valid token that returns to the initial object', async () => {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      expect(data.name).to.equal('A test username');
      expect(data.hashed_password).to.equal('12345678');
    });

    it('should return a token whose payload is an object containing only four fields', () => {
      const hashedToken = jwt.verify(token, process.env.SECRET_KEY);
      expect(Object.keys(hashedToken).length).to.equal(4);
    });
  });
  describe('Edge cases', () => {
    it('Should throw an error when sent the wrong dataType', async () => {
      try {
        // sending an empty array to invoke an error;
        await Tokenizer([]);
      } catch (err) {
        expect(err.constructor).to.equal(TypeError);
        expect(err.message).to.equal("Invalid datatype. Expects type 'Object'  with keys 'name', 'username', 'id', 'avatar' ");
      }
    });

    it('Should throw an error when called with an object with incomplete keys', async () => {
      try {
        // deliberately leaving out the id in the object;
        await Tokenizer({ name: 'Hasstrup', username: 'Hasstrup', password: '1234' });
      } catch (err) {
        expect(err.message).to.equal("The object passed in should have keys 'id', 'username', 'name' and 'avatar'");
      }
    });
  });
});
