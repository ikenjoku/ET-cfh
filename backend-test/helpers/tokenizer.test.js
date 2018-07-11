/* eslint no-undef: 0 */
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { Tokenizer, decodeToken } from '../../app/helpers/tokenizer';

let token;

describe('Payload to token converter(Unit Test)', () => {
  describe('Success case', () => {
    before(() => {
      const payload = {
        name: 'A test username',
        _id: '123456ad',
        avatar: 'Hello there',
        username: 'Hasstrupezekiel'
      };
      token = Tokenizer(payload);
    });

    it(' Should return a valid token that returns to the initial object', () => {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      expect(data.name).to.equal('A test username');
    });

    it('should return a token whose payload is an object containing only four fields', () => {
      const userObject = jwt.verify(token, process.env.SECRET_KEY);
      // testing for four because jwt implicitly adds an 'iat' field to the payload object
      expect(Object.keys(userObject).length).to.equal(4);
    });
  });

  describe('Edge cases', () => {
    it('Should throw an error when sent the wrong dataType', () => {
      try {
        // sending an empty array to invoke an error;
        Tokenizer([]);
      } catch (err) {
        expect(err.constructor).to.equal(TypeError);
        expect(err.message).to.equal("The object passed in should have keys 'id', 'username', 'name' and 'avatar'");
      }
    });

    it('Should throw an error when called with an object with incomplete keys', () => {
      try {
        // deliberately leaving out the id in the object;
        Tokenizer({ name: 'Hasstrup', username: 'Hasstrup', password: '1234' });
      } catch (err) {
        expect(err.message).to.equal("The object passed in should have keys 'id', 'username', 'name' and 'avatar'");
      }
    });
  });

  describe('Token to payload helper method', () => {
    it('Should successfully decode a token, returning the initial object sent', () => {
      const payLoad = decodeToken(token);
      expect(payLoad.name).to.equal('A test username');
    });

    it('Should throw an error when sent the wrong datatype', () => {
      try {
        decodeToken([]);
      } catch (err) {
        expect(err.constructor).to.equal(TypeError);
        expect(err.message).to.equal('Please send in a token string, seems like you passed a wrong data type or nothing at all');
      }
    });
  });
});
