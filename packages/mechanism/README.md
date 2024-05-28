Python endpoints for:
- get_SP_answer_binary
- get_PMBA_answer
- get_exponent
- get_chomp_rewards


## Getting started

- Install python 3.12 as that's the version Vercel uses
  - Follow [these](https://gist.github.com/josemarimanio/9e0c177c90dee97808bad163587e80f8) instructions to install with pyenv on mac
  - `pyenv local 3.12.3`

```
cd packages/mechanics

# Confirm using Python 3.12
pip -V

# Create new venv
pip -m venv venv
venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
