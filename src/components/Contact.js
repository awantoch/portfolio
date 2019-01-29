import React from 'react';

const Contact = () => {
    return (
        <div className="container" style={{ paddingTop: '30px' }}>
            <div className="row">
            <form className="col s12" action="https://formspree.io/alec@wantoch.net" method="POST">
                <div className="row">
                    <div className="input-field col s12">
                        <input placeholder="Full name" name="name" type="text" className="validate" />
                    </div>
                </div>
                <div className="row">
                    <div className="input-field col s12">
                        <input placeholder="Email address" name="_replyTo" type="text" className="validate" />
                    </div>
                </div>
                <div className="row">
                    <div className="input-field col s12">
                        <textarea className="materialize-textarea" placeholder="Message body" name="body" className="validate"></textarea>
                    </div>
                </div>
                <div className="row center">
                    <input className="waves-effect waves-light btn" type="submit" value="Contact Me" />
                </div>
            </form>
            </div>
        </div>
    );
};

export default Contact;